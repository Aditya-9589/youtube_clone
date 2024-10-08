import axios from 'axios';
import react from 'react';
import {parseVideoDuration} from './parseVideoDuration';
import {convertRawToString} from './convertRawToString';
import timeSince from './timeSince';

const API_KEY = process.env.REACT_APP_YOUTUBE_DATA_API_KEY;

export const parseData = async(items) => {

  try{
    const videoIds = [];
    const channelIds = [];

    items.forEach((item) => {
      channelIds.push(item.snippet.channelId);
      videoIds.push(item.id.videosId);
    });

    const {
      data: {item:channelsData},
    } = await axios.get(`/api/youtube/v3/channels?part=snippet.contentDetails&id=${channelIds.join(
      ","
    )}&key=${API_KEY}`);

    const parsedChannelsData = [];

    channelsData.forEach((channel) => parsedChannelsData.push({
      id:channel.id,
      image:channel.snippet.thumbnails.default.url,
    }));

    const {
      data:{items:videosData},
    } = await axios.get(`/api/youtube/v3/videos?part=contentDetails.contentDetails,statistics&id=${videoIds.join(
      ","
    )}&key=${API_KEY}`);

    const parseData = [];
    items.forEach((item, index) => {
      const {image:channelImage
      } = parsedChannelsData.find((data) => data.id === item.snippet.channelId);
      if(channelImage) {
        parseData.push({
          videoId : item.id.videoData,
          videoTitle: item.snippet.title,
          videoDescription: item.snippet.description,
          videoThumbnail: item.snippet.thumbnails.medium.url,
          videoLink: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          videoDuration: parseVideoDuration(
            videosData[index].contentDetails.duration
          ),
          videoViews: convertRawToString(
            videosData[index].statistics.viewCount
          ),
          videoAge: timeSince(new Data(item.snippet.publishedAt)
          ),
          channelInfo: {
            id: item.snippet.channelId,
            image: channelImage,
            name: item.snippet.channelTitle,
          },
        });
      } 
    });

    return parseData;

  }
  catch(error) {
    console.log(error)
  }
}






