import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { useState } from 'react';
import { useMutation ,useQueryClient} from '@tanstack/react-query';
import toast, { LoaderIcon ,} from 'react-hot-toast';
import { completeOnboarding } from '../lib/api';
import ShuffleIcon from 'lucide-react/dist/esm/icons/Shuffle';
import { LANGUAGES } from '../constants';
import { Speech ,MapPinIcon,CameraIcon} from 'lucide-react';



const OnboardingPage = () => {
  const {authUser} = useAuthUser();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    fullName:authUser?.fullName || '',
    bio: authUser?.bio || '',
    nativeLanguage: authUser?.nativeLanguage || '',
    learningLanguage: authUser?.learningLanguage || '',
    location: authUser?.location || '',
    profilepic: authUser?.profilepic || '',
  });

  const {mutate:onboardingMutation,isPending} = useMutation({
    mutationFn: completeOnboarding,
    onSuccess:() =>{
      toast.success("Profile Onbaorded Successfully");
      queryClient.invalidateQueries({querykey:["authUser"]});
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    }
  })

  const handleSubmit  = (e) => {
    e.preventDefault();
     console.log("submit");
    onboardingMutation(formState);
  }
  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const RandomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState({... formState, ProfilePic: RandomAvatar});
    toast.success(" Avatar changed Successfully");
  };
    return (
    <div className='min-h-screen bg-base-100 flex items-center justify-center p-4'>
    <div className='card bg-base-200 w-full max-w-3xl shadow-xl '>
      <div className='card-body p-6 sm:p-8'>
        <h1 className=' text-2xl sm:text-3xl font-bold text-center mb-6'>Complete Your Profile</h1>
        <form onSubmit={handleSubmit} className='space-y-6'>
        {/* profile pic area /container*/}
        <div className='flex flex-col items-center justify-center space-y-4'>
        {/* img */}
        <div className='size-32 rounded-full bg-base-300 overflow-hidden'>
        {formState.ProfilePic ? (
          <img
            src={formState.ProfilePic}
            alt='Profile Pic'
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='flec items-center justify-center h-full'>
            <CameraIcon className='size-12 text-base-content opacity-40  ml-9 mt-10' />
          </div>
        
        )}
        </div>
        {/* random avatar generation section */}
        <div className='flex items-centergap-2'>
          <button type = "button" onClick={handleRandomAvatar} className='btn btn-accent'>
            <ShuffleIcon className = 'size-4 mr-2'  />
             Generate Random Avatar
          </button>
        </div>
        </div>
        {/* full name  */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text'> Full Name</span>
          </label>
          <input
            type='text'
            name='fullName'
            value={formState.fullName}
            onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
            className='input input-bordered w-full'
            placeholder='Enter your full name'
            />
        </div>
        {/* bio */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text'> Bio</span>
          </label>
          <textarea
            type='text'
            name='bio'
            value={formState.bio}
            onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
            className='teextarea textarea-bordered h-24'
            placeholder='Tell others about yourself and your language learnign goals'
            />
        </div>
        {/* langaues */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* native langaugage */}
          <div className='from-control'>
            <label className='label'>
              <span className='label-text'> Native Language</span>
            </label>
            <select 
            name='nativeLanguage'
            value={formState.nativeLanguage}
            onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
            className='select select-bordered w-full'
          > 
          <option value=''>Select your native language</option>
          {LANGUAGES.map((lang) => (
            <option key={`native-${lang}`} value={lang.toLowerCase()}>
              {lang}
            </option>
          ))}
          </select>
        </div>
        {/* learning lanaguage */}
        <div className='from-control'>
            <label className='label'>
              <span className='label-text'> Learning Language</span>
            </label>
            <select 
            name='learningLanguage'
            value={formState.learningLanguage}
            onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
            className='select select-bordered w-full'
          > 
          <option value=''>Select your learning language</option>
          {LANGUAGES.map((lang) => (
            <option key={`native-${lang}`} value={lang.toLowerCase()}>
              {lang}
            </option>
          ))}
          </select>
        </div>

        </div>
        {/* location */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text'> Location</span>
          </label>
          <div className='relative'>
            <MapPinIcon className='absolute top-1/2 trasnform -translate-y-1/2 left-2 size-5 text-base-content opacity-70' />
            <input
            type='text'
            name='location'
            value={formState.location}
            onChange={(e) => setFormState({ ...formState, location: e.target.value })}
            className='input input-bordered w-full pl-8'
            placeholder='Enter your location'
            />
          </div>
        </div>
        {/* submit button area here */}
        <button type='submit'disabled={isPending} className='btn btn-primary w-full'>
         {!isPending? (
          <>
          <Speech className ='size-5 mr-2'/>
          Complete Onboarding
          </>
         ):(
          <>
          <LoaderIcon className='size-5 mr-2 animate-spin'/>
          Onboarding...
          </>
         )}
        </button>
        </form>
      </div>
    </div>
    </div>
  )
}

export default OnboardingPage
