export interface Data {
    data: {
      user: Array<any>;
    }
}
  
export interface User {
    login: string;
    attrs: {
      image: string;
      phonenumber: string;
      email: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      country: string;
    };
    campus: string;
    level: Array<{
      amount: number;
    }>;
}