export const VIEWTUBE_VIDEO_API = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=40&regionCode=IN&key=${process.env.API_KEY}`;
export const ONE_VIDEO_API = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&key=${process.env.API_KEY}`;
export const SEARCH_API_ONE_VIDEO = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&key=${process.env.API_KEY}`;
export const SEARCH_API = `http://suggestqueries.google.com/complete/search?client=firefox&ds=yt`;
