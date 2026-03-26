import conf from "../conf/conf";
import { Client, ID, Databases, Storage, Query } from "appwrite";



export class Service {
  client = new Client();
  Databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.Databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, feauturedImage, status, userId }) {
    try {
      return await this.Databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          feauturedImage,
          status,
          userId,
        },
      );
    } catch (error) {
      console.log("error", error);
    }
  }

  async updatePost(slug, { title, content, feauturedImage, status }) {
    try {
      return await this.Databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          feauturedImage,
          status,
        },
      );
    } catch (error) {
      console.log("error", error);
    }
  }

  async deletePost({ slug }) {
    try {
      await this.Databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getPost({ slug }) {
    try {
      return await this.Databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
      );
    } catch (error) {
      console.log("error", error);
      return false;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.Databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries,
        //!100, //!PAGINATION
        //!0, //!KITNE RESULT LE SAKTE HO
      );
    } catch (error) {
      console.log("error", error);
    }
  }

  //! FILE UPLOAD SERVICES

  async uploadfile({ file }) {
    try {
      await this.bucket.createFile(conf.appwriteBucketId, ID.unique(), file);
      return true;
    } catch (error) {
      console.log("error", error);
      return false;
    }
  }

  async deletefile({ fileId }) {
    try {
      return await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
    } catch (error) {
      console.log("error", error);
    }
  }

  getFilePreview({ fileId }) {
    return this.Storage.getFilePreview(
         conf.appwriteBucketId,
         fileId);
  }
}
const service = new Service();

export default service;
