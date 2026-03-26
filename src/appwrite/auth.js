import conf from "../conf/conf";
import { Client, Account,ID } from "appwrite";


export class AuthService {
    Client = new Client();
    account;

    constructor () {
        this.Client
                 .setEndpoint(conf.appwriteUrl)
                 .setProject(conf.appwriteProjectId);
        this.account = new Account(this.Client);
    }

    async createAccount({email, password, name}){
        const userAccount =  await this.account.create(ID.unique(),email,password,name);
        if(userAccount){
            //call another method
            return this.login({email,password})

        }
        else{
            return userAccount;

        }
    }

    async login({ email, password }) {
        return this.account.createEmailPasswordSession(email, password);
    }

    async getCurrentUser(){
        try {

            return await this.account.get();
            
        } catch (error) {
            console.log("Appwrite service :: getCurrentUser :: error ", error);
            
        }
        return null; 
    }

    async logout() {
        try {
            return await this.account.deleteSessions()
        } catch (error) {
            console.log("Appwrite error is ",error);
            
        }
    }
}



const authService = new AuthService();

export default authService 