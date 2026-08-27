export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
}

export interface RegisterRequest {

    username: string;
    email:string; 
    password: string 

  }

export interface LoginRequest  {

  username: string;
  password: string 

}