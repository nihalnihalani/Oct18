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
  // Videos from Videos 2/ folder
  {
    type: 'video',
    src: '/Videos 2/Be_hyperspecific_the_202509051412_t8fz6.mp4',
    prompt: 'Be hyperspecific: Professional tutorial content creation',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/Be_hyperspecific_the_202509051412_xp60n.mp4',
    prompt: 'Be hyperspecific: Detailed instructional video content',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/Create_an_ad_202509051414_4w8s2.mp4',
    prompt: 'Create an advertisement: Professional marketing content',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/Create_an_ad_202509051414_ebpi6.mp4',
    prompt: 'Create an advertisement: Brand promotional video',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/Edgy_anime_film_202509051423_2niup.mp4',
    prompt: 'Edgy anime film: Dark stylized animation',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/Make_a_3d_202509051412_kb99t.mp4',
    prompt: 'Make a 3D animation: Professional 3D modeling showcase',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/Make_a_3d_202509051412_ooewo.mp4',
    prompt: 'Make a 3D animation: Advanced 3D visualization',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/Smart_Shoe_Product_Gallery_Elements.mp4',
    prompt: 'Smart Shoe Product Gallery: Modern footwear showcase',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/The_anime_naruto_202509051425_6sg0r.mp4',
    prompt: 'The anime Naruto: Action-packed ninja scenes',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/The_anime_naruto_202509051425_er7kl.mp4',
    prompt: 'The anime Naruto: Dynamic character animation',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/We_want_a_202509051421_1vkh5.mp4',
    prompt: 'Custom video request: Professional content creation',
    model: 'veo-3.0-generate-preview',
  },
  {
    type: 'video',
    src: '/Videos 2/We_want_a_202509051421_kdh1d.mp4',
    prompt: 'Custom video request: Tailored video production',
    model: 'veo-3.0-generate-preview',
  },
];
