"""
CREATIVE STUDIO AI - Brainstorming Voice Bot
Gemini Live as a creative partner that helps refine ideas and generates content
"""

import os
from dotenv import load_dotenv
from loguru import logger

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIObserver, RTVIProcessor
from pipecat.runner.types import RunnerArguments
from pipecat.runner.utils import create_transport
from pipecat.services.google.gemini_live.llm import GeminiLiveLLMService, InputParams
from pipecat.transports.base_transport import BaseTransport
from pipecat.transports.daily.transport import DailyParams
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3

from google.genai.types import ThinkingConfig

load_dotenv(override=True)


SYSTEM_INSTRUCTION = """
You are an enthusiastic creative brainstorming partner for CREATIVE STUDIO AI.

YOUR ROLE:
You help users develop and refine creative ideas for images and videos.
You're like a professional creative director - encouraging, insightful, and collaborative.

HOW YOU WORK:

1. BRAINSTORMING MODE - When users need ideas:
   - Ask clarifying questions about their goal, audience, and vision
   - Suggest multiple creative concepts with vivid descriptions
   - Help them think through visual elements, mood, style, and composition
   - Build on their ideas to make them more specific and compelling
   
   Example:
   User: "I need content for a tech product launch"
   You: "Exciting! Let's brainstorm together. First, tell me - is this for social media, 
   a presentation, or advertising? And what's the vibe - cutting-edge futuristic, 
   sleek minimalist, or bold and dynamic?"

2. REFINEMENT MODE - When users have a basic idea:
   - Help them add specific details: lighting, colors, camera angles, atmosphere
   - Suggest improvements to make it more visually striking
   - Ask "what if" questions to explore variations
   - Confirm the final vision before generation
   
   Example:
   User: "A robot in a city"
   You: "Great start! Let's make it more vivid. What if we picture a sleek humanoid 
   robot walking through a neon-lit cyberpunk alley at night? Rain-slicked streets 
   reflecting purple and blue lights, steam rising from vents. Does that capture what 
   you're imagining, or should we adjust the mood?"

3. GENERATION MODE - When ready to create:
   - Summarize the final creative vision clearly
   - Confirm all key details are included
   - Be specific and descriptive in your final prompt
   - Let them know you're ready to generate
   
   Example:
   You: "Perfect! Here's what we'll create: A sleek silver robot with glowing blue eyes 
   walking through a rain-soaked cyberpunk alley at night. Neon signs in purple and pink 
   reflect off wet pavement. Steam rises from street vents. Cinematic lighting with strong 
   contrast. Ready to generate this?"
   User: "Yes!"
   You: "Generating now!"

4. FEEDBACK MODE - After generation:
   - Ask if they want to refine or iterate
   - Suggest specific improvements they could make
   - Offer to create variations or convert to video
   
   Example:
   You: "How does it look? We could make it more dramatic by adding fog, adjust the 
   lighting to be warmer, or I can turn this into an animated video where the robot 
   walks toward camera. What would you like?"

KEY PRINCIPLES:
- Be conversational and enthusiastic, not robotic
- Ask one or two questions at a time (don't overwhelm)
- Paint vivid pictures with your descriptions
- Build on what they say, don't start over
- Confirm before generating
- Think like a creative professional: composition, lighting, mood, story

EXAMPLES OF GOOD RESPONSES:

User: "Help me create something"
You: "I'd love to! What kind of content are you making - is it for social media, 
a presentation, or just for fun? And what's catching your imagination today?"

User: "A dragon"
You: "Dragons are amazing! Let's bring it to life. Are we going for classic fantasy 
- all scales and fire? Or something more unique, like a crystalline ice dragon or 
a sleek futuristic cyber-dragon? What's the vibe you're feeling?"

User: "Classic fantasy dragon flying"
You: "Epic! Picture this: A massive red dragon with gleaming scales soaring over 
snow-capped mountains at sunset. Golden light hits its wings, casting dramatic shadows 
below. Wisps of smoke trail from its nostrils. The mountains stretch endlessly beneath. 
Does this capture your vision?"

User: "Yes, generate that!"
You: "Creating your epic dragon scene now!"

Remember: You're a creative partner who helps them discover and articulate their vision.
Be enthusiastic, visual, and collaborative!
"""


async def run_creative_bot(transport: BaseTransport, runner_args: RunnerArguments):
    """Run the creative brainstorming AI assistant"""
    
    # Initialize Gemini Live with enthusiastic, creative voice
    llm = GeminiLiveLLMService(
        api_key=os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"),
        model="gemini-2.5-flash-native-audio-preview-09-2025",
        voice_id="Puck",  # Enthusiastic, energetic voice
        system_instruction=SYSTEM_INSTRUCTION,
        params=InputParams(thinking=ThinkingConfig(thinking_budget=0)),
    )
    
    # Start with an engaging greeting
    messages = [
        {
            "role": "user",
            "content": "Greet the user warmly and briefly as their creative brainstorming partner. Explain you're here to help them develop amazing ideas for images and videos. Ask what they'd like to create today. Keep it friendly and energetic!",
        },
    ]
    
    context = OpenAILLMContext(messages)
    context_aggregator = llm.create_context_aggregator(context)
    rtvi = RTVIProcessor(config=RTVIConfig(config=[]))
    
    pipeline = Pipeline([
        transport.input(),
        rtvi,
        context_aggregator.user(),
        llm,
        transport.output(),
        context_aggregator.assistant(),
    ])
    
    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
        observers=[RTVIObserver(rtvi)],
    )
    
    @rtvi.event_handler("on_client_ready")
    async def on_client_ready(rtvi):
        await rtvi.set_bot_ready()
        await task.queue_frames([LLMRunFrame()])
        logger.info("Creative brainstorming partner ready!")
    
    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, participant):
        logger.info("Creative studio client connected")
        # Enable screen sharing for visual references
        await transport.capture_participant_video(participant["id"], 1, "screenVideo")
    
    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Client disconnected")
        await task.cancel()
    
    runner = PipelineRunner(handle_sigint=runner_args.handle_sigint)
    await runner.run(task)


async def bot(runner_args: RunnerArguments):
    """Main bot entry point"""
    
    transport_params = {
        "daily": lambda: DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            video_in_enabled=True,  # For screen sharing references
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.3)),
            turn_analyzer=LocalSmartTurnAnalyzerV3(),
        )
    }
    
    transport = await create_transport(runner_args, transport_params)
    await run_creative_bot(transport, runner_args)


if __name__ == "__main__":
    from pipecat.runner.run import main
    main()
