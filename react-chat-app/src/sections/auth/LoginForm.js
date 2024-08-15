import React , { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import FormProvider from '../../components/hook-form/FormProvider'
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, IconButton, InputAdornment, Link, Stack } from '@mui/material';
import { RHFTextField } from '../../components/hook-form';
import { Eye, EyeSlash } from 'phosphor-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const LoginForm = () => {

  const [showPassword, setShowPassword] = useState(false);

  //validation rules 
  const loginSchema = Yup.object().shape({
    email:Yup.string().required('Username is required'),
    // password:Yup.string().required('Password is required')
  });

  const defaultValues = {
    email:'webbythien',
    // password:'dula@123'
  };

  const methods = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues
  });

  const {reset, setError, handleSubmit, formState:{errors, isSubmitting, isSubmitSuccessful}}
   = methods;
   const navigate = useNavigate();

   const onSubmit = async (data) =>{
        try {
            //submit data to backend
            localStorage.setItem("username", data.email )
            const uuid = uuidv4();
            localStorage.setItem("uuid",uuid )
            navigate('/app')
        } catch (error) {
            console.log(error);
            reset();
            setError('afterSubmit',{
                ...error,
                message: error.message
            })
        }
   }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
            {!!errors.afterSubmit && <Alert severity='error'>{errors.afterSubmit.message}</Alert>}
        
        <RHFTextField name='email' label='Username'/>
        {/* <RHFTextField name='password' label='Password' type={showPassword ? 'text' : 'password'}
        InputProps={{endAdornment:(
            <InputAdornment>
            <IconButton onClick={()=>{
                setShowPassword(!showPassword);
            }}>
                {showPassword ? <Eye/>: <EyeSlash/>}
            </IconButton>
            </InputAdornment>
        )}}/> */}
        </Stack>
        <Stack alignItems={'flex-end'} sx={{my:2}}>
            {/* <Link component={RouterLink} to='/auth/reset-password'
             variant='body2' color='inherit' underline='always'>Forgot Password?</Link> */}
        </Stack>
        <Button fullWidth color='inherit' size='large' type='submit' variant='contained'
        sx={{bgcolor:'text.primary', color:(theme)=> theme.palette.mode === 'light' ?
         'common.white':'grey.800',
         '&:hover':{
            bgcolor:'text.primary',
            color:(theme)=> theme.palette.mode === 'light' ? 'common.white':'grey.800',
         }}}>Login</Button>
    </FormProvider>
  )
}

export default LoginForm