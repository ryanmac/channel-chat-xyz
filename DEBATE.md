### REQUIREMENTS for the Debate Feature

#### **User Interaction:**
1. **Channel Selection**
   - The user selects 2 channels to participate in a debate using ChannelSearch component
   - As a channel 1 is selected, the ChannelSearch input disappears, leaving only the selected channel 1. Same for Channel 2.

2. **Topic Selection:**
   - Once 2 channels are selected, the TopicSelection component shows 3 topics.
   - The user clicks the "Start" button on the topic they are interested in.
   - The "Start" button briefly changes to "Starting..." and disables to prevent multiple clicks.

3. **Debate Structure:**
   - The debate consists of a structured sequence: 1 introduction, 3 responses, and 1 conclusion from each channel, to ensure the debate does not go on indefinitely.

#### **Debate Flow:**
1. **Introduction Phase:**
   - Each AI (Channel 1 and Channel 2) provides an introduction to their argument, one after the other.
   - Channel 1 starts first, followed by Channel 2, with typing indicators shown between introductions. (Typing indicators display on their repective side: left for channel 1, right for channel 2)

2. **Response Phase:**
   - Each channel alternates in giving a total of 3 responses:
     - **Response 1:** Channel 1 responds, then Channel 2.
     - **Response 2:** Channel 1 responds, then Channel 2.
     - **Response 3:** Channel 1 responds, then Channel 2.
   - Typing indicators are shown between each response to simulate real-time interaction. The typing indicator for Channel 1 displays on the left side of the debate chat interface. The typing indicator for Channel 2 displays on the right side of the debate chat interface

3. **Conclusion Phase:**
   - Each channel provides one final conclusion:
     - Channel 1 gives its conclusion, followed by Channel 2.
   - This marks the end of the debate.

#### **URL and Sharing:**
1. **Unique Debate URL:**
   - Each debate session generates a unique URL with a `debateId`, formatted like `/debate/[debateId]`.
   - The `debateId` is generated using a `cuid` and aligns with the `Debate.id` schema.

2. **Loading Past Debates:**
   - Any page loaded with a specific `debateId` should retrieve and display the entire debate conversation, allowing users to view and share past debates.

#### **Technical Requirements:**
- Limit each AI to a total of 5 interactions: 1 introduction, 3 responses, and 1 conclusion (10 total).
- Ensure smooth transitions between responses with typing indicators to maintain a natural debate flow.
- Responses and conclusions should be displayed sequentially to provide a clear and engaging debate format.
- Only one api/debate request should be pending at a time. First to Channel 1's introduction, then Channel 2's introduction, then Channel 1's first response, then Channel 2's first response, then Channel 1's second response, then Channel 2's second response, then Channel 1's third response, then Channel 2's third response, then Channel 1's conclusion, then Channel 2's conclusion.