const conf = {
    appwriteUrl : String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRTE_PROJECT_ID),
    appwriteCollectionId : String(import.meta.env.VITE_APPWRTE_COLLECTION_ID),
    appwriteDatabaseId : String(import.meta.env.VITE_APPWRTE_DATABASE_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPWIRTE_BUCKET_ID),
    
}; 
export default conf;