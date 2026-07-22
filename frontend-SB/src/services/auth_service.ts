import api from "./api";

export interface LoginData {

    email: string;

    password: string;

}


export interface RegisterData {

    name: string;

    email: string;

    password: string;

    phone_number: string;

    role: string;

}

export const login = async (

    data: LoginData,

) => {

    const response = await api.post(

        "/auth/login",

        data,

    );

    return response.data;

};

export const register = async (

    data: RegisterData,

) => {

    const response = await api.post(

        "/auth/register",

        data,

    );

    return response.data;

};

export const getProfile = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};