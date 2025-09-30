import axiosClient from './axiosClient';


export const getAccess = (data) =>
    axiosClient.post('/get-access', data);

export const login = (data) =>
    axiosClient.post('/login', data);

export const forgotpassword = (data) =>
    axiosClient.post('/forgot-password', data);

export const resetPassword = (data) =>
    axiosClient.post('/reset-password', data);