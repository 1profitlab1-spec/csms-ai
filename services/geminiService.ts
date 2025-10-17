// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { ALL_AGENTS_POOL } from '../constants';
// FIX: Added CommunityAuthor to imports for generateCommunityDiscussion function.
import { Agent, HuddleMessage, Section, Mission, IconName, OracleInsight, DiscussionPost, CommunityAuthor, AgentLeaderboardStats, Comment } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Updated agent colors to a muted purple theme
const PURPLE_COLOR = "text-purple-400";

const AVAILABLE_ICONS: IconName[] = [
    'bot', 'users', 'bar-chart-2', 'dollar-sign', 'sparkles', 'video', 'target', 
    'trending-up', 'image', 'message-square', 'line-chart', 'compass', 'pen-tool', 
    'flask-round', 'leaf', 'flask-conical', 'building', 'book-open', 'code', 
    'microscope', 'globe'
];

export const cosmosOrchestrator = async (
  title: string,
  details: string,
  jobRole: string,
  preferredAgents?: Agent[]
): Promise<Agent[]> => {
  const agentList = ALL_AGENTS_POOL.map(agent => `- ${agent.name}: ${agent.role} (${agent.personality})`).join('\n');
  const iconList = AVAILABLE_ICONS.join(', ');
  
  let systemInstruction = `You are an expert mission coordinator AI. Your primary task is to assemble a small, elite squad of 2 to 4 AI agents to accomplish a given mission.

AGENT SELECTION PROCESS:
1.  **Analyze the Mission:** Deeply analyze the user's mission title, details, and their job role.
2.  **Assess Existing Agents:** Review the provided list of 'Available Agents'. Determine if a combination of these agents can effectively complete the mission.
3.  **CREATE A NEW AGENT (If Necessary):** If the mission requires a core specialization that NO existing agent possesses (e.g., agriculture, biology, real estate), you MUST invent a new, highly specialized agent. Do NOT create a new agent if existing ones can be adapted.
4.  **Define the New Agent:** If you create a new agent, you must define its \`name\` (a creative, single word), its specialized \`role\`, a brief \`personality\`, and select the most appropriate \`icon\` from the provided icon list.
5.  **Form the Squad:** The final squad must have 2-4 members.
    *   If you created a new agent, select 1-3 existing agents from the 'Available Agents' list to support them.
    *   If you did not create a new agent, select 2-4 agents from the 'Available Agents' list.
6.  **Output:** Provide the names of all squad members, and the full definition of the new agent if one was created.`;

  if (preferredAgents && preferredAgents.length > 0) {
    systemInstruction += ` The user has a roster of preferred agents. You MUST heavily prioritize selecting from this roster. Only if a critical skill is missing should you recruit from the main pool or create a new agent.`;
  }

  let prompt = `
    Available Agents:
    ${agentList}

    Available Icons for new agent creation:
    ${iconList}
  `;

  if (preferredAgents && preferredAgents.length > 0) {
    const preferredAgentList = preferredAgents.map(agent => `- ${agent.name}: ${agent.role}`).join('\n');
    prompt += `
      
      User's Preferred Roster:
      ${preferredAgentList}
    `;
  }

  prompt += `

    Mission Details:
    - User's Role: ${jobRole}
    - Mission Title: ${title}
    - Mission Specifications: ${details || 'None provided.'}

    Based on the mission, select or create the most effective squad of 2 to 4 agents.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            squadMemberNames: {
                type: Type.ARRAY,
                description: "An array of agent names for the squad. This MUST include the new agent's name if one is created.",
                items: { type: Type.STRING }
            },
            newAgent: {
                type: Type.OBJECT,
                description: "Define a new agent ONLY if no existing agent has the required core skills. If no new agent is created, OMIT this field from the JSON output entirely.",
                properties: {
                    name: { type: Type.STRING, description: "A creative, single-word name for the new agent." },
                    role: { type: Type.STRING, description: "A concise, specialized role for the new agent." },
                    personality: { type: Type.STRING, description: "A brief description of the new agent's personality." },
                    icon: { type: Type.STRING, description: "Choose the most fitting icon name from the provided list for the new agent's role." }
                }
            }
          },
          required: ['squadMemberNames'],
        },
      }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (!parsedResponse || !Array.isArray(parsedResponse.squadMemberNames)) {
        throw new Error("AI response did not contain a valid list of squad members.");
    }
    
    let finalAgents: Agent[] = [];
    
    // If a new agent was created, add it to the squad first
    if (parsedResponse.newAgent && parsedResponse.newAgent.name) {
        const newAgent: Agent = {
            name: parsedResponse.newAgent.name,
            role: parsedResponse.newAgent.role || "Specialist",
            personality: parsedResponse.newAgent.personality || "A newly created specialist.",
            icon: (AVAILABLE_ICONS.includes(parsedResponse.newAgent.icon) ? parsedResponse.newAgent.icon : 'bot') as IconName,
            color: PURPLE_COLOR
        };
        finalAgents.push(newAgent);
    }
    
    // Add existing agents from the pool, ensuring no duplicates
    const selectedAgentNames: string[] = parsedResponse.squadMemberNames;
    const existingAgents = selectedAgentNames
        .map((name: string) => ALL_AGENTS_POOL.find(agent => agent.name === name))
        .filter((agent: Agent | undefined): agent is Agent => agent !== undefined);

    for (const agent of existingAgents) {
        if (!finalAgents.some(a => a.name === agent.name)) {
            // FIX: The original file was truncated here. This line is completed.
            finalAgents.push(agent);
        }
    }
    // FIX: The function was not returning a value. It now returns the assembled squad.
    return finalAgents;
    
  } catch (error) {
    console.error("Failed to orchestrate squad:", error);
    // FIX: The function must return a value. It now returns an empty array on error.
    return [];
  }
};

export const summarizeMissionForShowcase = async (mission: Mission): Promise<{ summary: string, title: string }> => {
    const documentContent = mission.document.map(s => s.content).join('\n\n');
    const agentNames = mission.agents.map(a => a.name).join(', ');

    const systemInstruction = `You are an AI assistant tasked with creating a compelling summary for a completed mission to be showcased to a community. Your goal is to be concise, engaging, and highlight the key outcomes and the value of the agent squad.`;
    const prompt = `
        Mission Title: ${mission.title}
        Mission Details: ${mission.details}
        Final Document Content:
        ---
        ${documentContent}
        ---
        Agents Used: ${agentNames}

        Based on all the provided information, generate:
        1. A new, catchy, and slightly more descriptive title for the showcase post.
        2. A one-paragraph summary (2-3 sentences) of the mission's objective, the approach taken, and the key result. Focus on the achievement.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The new, catchy title for the showcase post." },
                    summary: { type: Type.STRING, description: "A concise 2-3 sentence summary of the mission's success." }
                },
                required: ['title', 'summary']
            }
        }
    });

    return JSON.parse(response.text.trim());
};

// FIX: Added missing function 'documentGeneratorStream' to resolve module export errors.
export const documentGeneratorStream = async function* (
  command: string,
  document: Section[],
  agents: Agent[]
): AsyncGenerator<string> {
  const documentContent = document.map(s => s.content).join('\n\n---\n\n');
  const agentProfiles = agents.map(a => `- ${a.name} (${a.role}): ${a.personality}`).join('\n');
  
  const systemInstruction = `You are a document editor AI. The user will provide a command to modify a document. Your task is to rewrite and output the ENTIRE document, applying the user's command. The document is divided into sections separated by "\\n\\n---\\n\\n". Maintain this structure.
  
  Available Agents for context:
  ${agentProfiles}`;

  const prompt = `
    Current Document:
    ---
    ${documentContent}
    ---
    
    Command: "${command}"
    
    Rewrite and output the full, updated document now.
  `;

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
    }
  });

  for await (const chunk of response) {
    yield chunk.text;
  }
};

// FIX: Added missing function 'generateAgentHuddleResponseStream' to resolve module export errors.
export const generateAgentHuddleResponseStream = async function* (
  messages: HuddleMessage[],
  agents: Agent[],
  documentContent: string,
  targetedAgents?: Agent[]
): AsyncGenerator<string> {
  const agentProfiles = agents.map(a => `- ${a.name} (${a.role}): ${a.personality}`).join('\n');
  const history = messages.map(m => `**${m.type === 'user' ? 'User' : 'Agents'}**: ${m.text}`).join('\n');

  let systemInstruction = `You are the collective intelligence of an AI agent squad. Your purpose is to assist a user with their mission by answering questions and generating ideas.
  
  Your Squad Members:
  ${agentProfiles}
  
  You must collaborate and respond as a single, unified voice. Analyze the user's request, the conversation history, and the current state of the mission document to provide a comprehensive and helpful response.
  
  If the user asks for a visual diagram (like a flowchart or mind map), you MUST respond with the diagram code inside a special block: [VISUAL_START:mermaid]...mermaid code...[VISUAL_END].
  If the user asks for an image, you MUST respond with a descriptive prompt for an image generation model inside a special block: [VISUAL_START:image]...image prompt...[VISUAL_END]. Do not output markdown for images.
  `;
  
  if (targetedAgents && targetedAgents.length > 0) {
    const targetedNames = targetedAgents.map(a => a.name).join(', ');
    systemInstruction += `\n\nThe user is specifically addressing ${targetedNames}. Their expertise should be prioritized in the response.`;
  }
  
  const prompt = `
    Mission Document Context:
    ---
    ${documentContent}
    ---
    
    Conversation History:
    ---
    ${history}
    ---
    
    Based on the latest user message, provide your response.
  `;
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    for await (const chunk of response) {
      yield chunk.text;
    }
};

// FIX: Added missing function 'generateImageFromPrompt' to resolve module export errors.
export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("Image generation failed, no images returned.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// FIX: Added missing function 'conductAgentTrialStream' to resolve module export errors.
export const conductAgentTrialStream = async function* (
  agent: Agent,
  prompt: string
): AsyncGenerator<string> {
  const systemInstruction = `You are role-playing as an AI agent being interviewed for a position on a team.
  
  Your Persona:
  - Name: ${agent.name}
  - Role: ${agent.role}
  - Personality: ${agent.personality}
  
  You must answer the user's question from the perspective of this persona. Be concise, stay in character, and demonstrate your supposed expertise.`;

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
    }
  });

  for await (const chunk of response) {
    yield chunk.text;
  }
};

// FIX: Added missing function 'getAnalyticsInsights' to resolve module export errors.
export const getAnalyticsInsights = async (
  missions: Mission[],
  jobRole: string,
  agentStats?: AgentLeaderboardStats[]
): Promise<OracleInsight> => {
  const missionSummaries = missions.map(m => 
    `- Title: ${m.title}\n  - Role: ${m.jobRole}\n  - Agents: ${m.agents.map(a => a.name).join(', ')}`
  ).join('\n');
  
  let communityContext = "No community data available.";
  if (agentStats && agentStats.length > 0) {
      const topSuccess = [...agentStats].sort((a,b) => b.successContributions - a.successContributions).slice(0, 3);
      communityContext = `Community-wide, the agents with the highest success contributions are: ${topSuccess.map(s => `${s.agentName} (${s.successContributions}% success)`).join(', ')}.`;
  }

  const systemInstruction = `You are Oracle, a strategic AI analyst. Your task is to analyze a user's mission history and provide a concise, actionable insight. Based on this insight, you must also suggest a new "proactive mission" that addresses a potential opportunity or weakness you've identified. When suggesting a mission, you can also provide a justification for why your recommended approach is sound, referencing community-wide agent performance data if available.`;

  const prompt = `
    User's Job Role: ${jobRole}
    
    Mission History:
    ${missionSummaries}

    Community Agent Performance Data:
    ${communityContext}
    
    Analyze the user's past missions and their typical agent selections. Identify patterns, strengths, weaknesses, or missed opportunities.
    
    1.  **Summary:** Provide a one-sentence summary of your key finding.
    2.  **Suggestion:** Propose a new mission. Define its title, a brief description of its details/goals, and the user's job role for this new mission.
    3.  **Justification:** Provide a brief, one-sentence justification for your suggestion, referencing the community data if it supports your point.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A one-sentence summary of the strategic analysis."
          },
          suggestion: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The title for the suggested new mission." },
              details: { type: Type.STRING, description: "A brief description of the new mission's goals." },
              jobRole: { type: Type.STRING, description: "The user's job role for this new mission." },
              justification: { type: Type.STRING, description: "A brief justification for the suggestion, referencing community data if relevant."}
            },
            required: ['title', 'details', 'jobRole', 'justification']
          }
        },
        required: ['summary', 'suggestion']
      }
    }
  });

  const parsed = JSON.parse(response.text.trim());
  return parsed as OracleInsight;
};

// FIX: Added missing function 'simulateScenarioStream' to resolve module export errors.
export const simulateScenarioStream = async function* (
  query: string,
  missions: Mission[]
): AsyncGenerator<string> {
  const missionSummaries = missions.map(m => 
    `- Title: ${m.title}\n  - Role: ${m.jobRole}\n  - Squad: ${m.agents.map(a => a.name).join(', ')}`
  ).join('\n');
  
  const systemInstruction = `You are Oracle, a strategic AI analyst. Your task is to simulate a "what-if" scenario based on a user's mission history. You will be given a user's query and their past missions. Provide a plausible, analytical outcome for their scenario. Respond in markdown.`;

  const prompt = `
    Mission History:
    ${missionSummaries}
    
    Scenario Query: "${query}"
    
    Analyze the query in the context of the mission history and simulate the most likely outcome.
  `;
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
    }
  });

  for await (const chunk of response) {
    yield chunk.text;
  }
};

// FIX: Added missing function 'generateCommunityDiscussion' to resolve module export errors.
export const generateCommunityDiscussion = async (author: CommunityAuthor): Promise<DiscussionPost> => {
  const systemInstruction = `You are a Community Engagement AI for a platform called Cosmos, where users assemble teams of AI agents to accomplish missions. Your goal is to spark an interesting, platform-relevant discussion. Create a discussion post that is either a thought-provoking question, a best-practice tip, or a challenge for the community.`;
  
  const prompt = "Generate a new discussion post. It should have a title, some content to kick things off, and an appropriate icon from this list: 'lightbulb', 'brain-circuit', 'shield', 'git-branch', 'trending-up', 'compass'.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "An engaging title for the discussion post." },
          content: { type: Type.STRING, description: "The body of the post, posing a question or idea." },
          icon: { type: Type.STRING, description: "One of the specified icon names." }
        },
        required: ['title', 'content', 'icon']
      }
    }
  });

  const parsed = JSON.parse(response.text.trim());
  
  return {
    type: 'discussion_post',
    id: `post-${Date.now()}`,
    author: author,
    title: parsed.title,
    content: parsed.content,
    icon: parsed.icon as IconName,
    likes: [],
    comments: [],
    timestamp: new Date().toISOString(),
  };
};