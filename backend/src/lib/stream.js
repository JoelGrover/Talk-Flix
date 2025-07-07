import {StreamChat} from 'stream-chat';
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    console.error("Stream API key and secret must be provided in environment variables.");
}
// console.log("Stream API Key:", apiKey);
// console.log("Stream API Secret:", apiSecret);

const streamClient = StreamChat.getInstance(apiKey, apiSecret);
streamClient.axiosInstance.defaults.timeout = 10000;
export const upsertStreamUser = async ( userData) => {
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }catch(err) {
        console.error("Error creating/updating Stream user:", err);
        throw new Error("Failed to create or update Stream user");
    }
}

export const generateStreamToken = (userId) => {
    try{
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    }catch(Error) {
        console.error("Error generating Stream token:", Error);
        throw new Error("Failed to generate  chat Stream token");
    }
}