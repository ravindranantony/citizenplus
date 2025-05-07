import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Upload, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  description: string;
  image?: FileList;
}

interface SubmitReportFormProps {
  onSuccess: () => void;
}

const SubmitReportForm: React.FC<SubmitReportFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiProcessed, setAiProcessed] = useState<{ 
    clean_text: string; 
    category: string | null;
  } | null>(null);
  const [processingAi, setProcessingAi] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
        }
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const processWithAI = async (description: string) => {
    setProcessingAi(true);
    
    try {
      // This is a mock implementation. In a real app, this would call the Deepseek API
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock AI processing result
      const cleanedText = description
        .replace(/(\b[a-z])/g, match => match.toUpperCase()) // Capitalize first letter of words
        .trim();
        
      // Simple category detection based on keywords
      let category = null;
      if (description.match(/garbage|trash|waste|litter|rubbish/i)) {
        category = 'sanitation';
      } else if (description.match(/water|leak|pipe|flooding|drain/i)) {
        category = 'water';
      } else if (description.match(/road|pothole|street|pavement|sidewalk/i)) {
        category = 'road';
      } else if (description.match(/light|electricity|power|outage|lamp/i)) {
        category = 'electricity';
      } else if (description.match(/corrupt|bribe|illegal|fraud/i)) {
        category = 'corruption';
      } else if (description.match(/danger|unsafe|crime|security|threat/i)) {
        category = 'safety';
      }
      
      setAiProcessed({
        clean_text: cleanedText,
        category
      });
    } catch (error) {
      console.error('Error processing with AI:', error);
    } finally {
      setProcessingAi(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      // Process with AI if not already done
      if (!aiProcessed) {
        await processWithAI(data.description);
      }
      
      let imageUrl = null;
      
      // Upload image if provided
      if (data.image && data.image[0]) {
        const file = data.image[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `reports/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase
          .storage
          .from('reports')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('reports')
          .getPublicUrl(filePath);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Create report in database
      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          raw_text: data.description,
          clean_text: aiProcessed?.clean_text || data.description,
          category: aiProcessed?.category,
          status: 'pending',
          latitude: location?.lat || null,
          longitude: location?.lon || null,
          image_url: imageUrl
        });
        
      if (error) {
        throw error;
      }
      
      // TODO: Send email to authority via Resend API
      // This would be handled in a Supabase Edge Function in a real app
      
      // Award points to user
      await supabase.rpc('increment_user_points', { user_id: user.id, points_to_add: 10 });
      
      reset();
      setImagePreview(null);
      setAiProcessed(null);
      onSuccess();
      
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Issue Description
        </label>
        <textarea
          id="description"
          rows={5}
          placeholder="Describe the issue in detail..."
          className={`w-full rounded-md border ${
            errors.description ? 'border-danger-500' : 'border-gray-300'
          } shadow-sm p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          {...register('description', { 
            required: 'Description is required',
            minLength: {
              value: 10,
              message: 'Description must be at least 10 characters'
            }
          })}
          onChange={(e) => {
            if (e.target.value.length >= 10) {
              // Clear previous AI processing when text changes significantly
              setAiProcessed(null);
            }
          }}
        />
        {errors.description && (
          <p className="mt-1 text-danger-500 text-sm">{errors.description.message}</p>
        )}
      </div>
      
      {aiProcessed && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">AI Enhanced Version</h3>
          <p className="text-gray-800">{aiProcessed.clean_text}</p>
          
          {aiProcessed.category && (
            <div className="mt-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700">
                {aiProcessed.category.charAt(0).toUpperCase() + aiProcessed.category.slice(1)}
              </span>
            </div>
          )}
        </div>
      )}
      
      {!aiProcessed && !processingAi && data.description?.length >= 10 && (
        <button
          type="button"
          onClick={() => processWithAI(data.description)}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
        >
          <span>Process with AI</span>
        </button>
      )}
      
      {processingAi && (
        <div className="flex items-center text-gray-600">
          <Loader className="animate-spin h-4 w-4 mr-2" />
          <span>Processing with AI...</span>
        </div>
      )}
      
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Add Image (optional)
        </label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="image"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 px-4">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload an image</p>
              </div>
            )}
            <input
              id="image"
              type="file"
              accept="image/*"
              className="hidden"
              {...register('image')}
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <div className="flex items-center space-x-2">
          {locationLoading ? (
            <div className="flex items-center text-gray-600">
              <Loader className="animate-spin h-4 w-4 mr-2" />
              <span>Detecting location...</span>
            </div>
          ) : location ? (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-primary-500 mr-2" />
              <span className="text-gray-700">
                Location detected: {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <button
                type="button"
                onClick={detectLocation}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                <MapPin className="h-4 w-4 mr-2" />
                <span>Detect my location</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? (
            <>
              <Loader className="animate-spin h-4 w-4 mr-2" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Report</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default SubmitReportForm;