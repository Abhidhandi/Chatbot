const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

let conversationHistory = [];

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Send message on Enter (Shift+Enter for new line)
messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Remove welcome message if it exists
    const welcomeMsg = chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable send button
    sendButton.disabled = true;
    
    // Show typing indicator
    typingIndicator.classList.add('active');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Get AI response
    getAIResponse(message);
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'bot' ? '🤖' : '👤';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getAIResponse(userMessage) {
    conversationHistory.push({
        role: 'user',
        content: userMessage
    });

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-or-v1-1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful, friendly AI assistant. Provide clear, concise, and helpful responses.'
                    },
                    ...conversationHistory
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        
        conversationHistory.push({
            role: 'assistant',
            content: aiMessage
        });

        // Hide typing indicator
        typingIndicator.classList.remove('active');
        
        // Add AI response
        addMessage(aiMessage, 'bot');
        
    } catch (error) {
        console.error('Error:', error);
        
        // Hide typing indicator
        typingIndicator.classList.remove('active');
        
        // Fallback response using a simple pattern-based system
        const fallbackResponse = getFallbackResponse(userMessage);
        addMessage(fallbackResponse, 'bot');
        
        conversationHistory.push({
            role: 'assistant',
            content: fallbackResponse
        });
    } finally {
        // Re-enable send button
        sendButton.disabled = false;
        messageInput.focus();
    }
}

function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! How can I assist you today?";
    } else if (lowerMessage.includes('how are you')) {
        return "I'm doing great, thank you for asking! How can I help you?";
    } else if (lowerMessage.includes('your name')) {
        return "I'm SmartTalk AI, your friendly assistant!";
    } else if (lowerMessage.includes('thank')) {
        return "You're welcome! Feel free to ask me anything else.";
    } else if (lowerMessage.includes('bye')) {
        return "Goodbye! Have a great day!";
    } else {
        return "I'm here to help! Could you please rephrase your question or try asking something else?";
    }
}

// Focus input on load
messageInput.focus();