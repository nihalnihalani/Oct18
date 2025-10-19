/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  prompt: string;
  model: string;
  createdAt: Date;
  thumbnail?: string;
}

/** Base URL for static files. */
const staticFilesUrl =
  'https://www.gstatic.com/aistudio/starter-apps/veo3-gallery/';

/** Mock videos for the gallery. */
export const MOCK_GALLERY_ITEMS: Omit<GalleryItem, 'id' | 'createdAt'>[] = [
  {
    type: 'video',
    src: staticFilesUrl + 'Stop_Motion_Fluffy_Characters__Culinary_Disaster.mp4',
    prompt: "Stop Motion: Fluffy Characters' Culinary Disaster",
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Claymation_Robot_s_Existential_Crisis.mp4',
    prompt: "Claymation: Robot's Existential Crisis",
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Abstract_Cinematic_The_Mechanical_Heartbeat.mp4',
    prompt: 'Abstract Cinematic: The Mechanical Heartbeat',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Characters_intense_talking.mp4',
    prompt: 'Characters Intense Talking',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Live_Performance_Soulful_Singer_s_Ballad.mp4',
    prompt: "Live Performance: Soulful Singer's Ballad",
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Nature_Monkeys.mp4',
    prompt: 'Nature Monkeys',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Video_Game_Trailer_Sci_Fi_Urban_Chasemp4.mp4',
    prompt: 'Video Game Trailer: Sci-Fi Urban Chase',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Animals_in_Nature_Bear_and_River.mp4',
    prompt: 'Animals in Nature: Bear and River',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Kyoto_Serenity_From_Scene_to_Postcard.mp4',
    prompt: 'Kyoto Serenity From Scene to Postcard',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: staticFilesUrl + 'Fluffy_Characters_Picnic_in_a_Mushroom_Forest.mp4',
    prompt: 'Fluffy Characters Picnic in a Mushroom Forest',
    model: 'veo-3.0-generate-preview',
  },
];
