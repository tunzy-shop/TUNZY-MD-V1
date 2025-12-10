module.exports = {
    // Tic Tac Toe game
    async tictactoe(sock, msg, args) {
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user to play with\nExample: .tictactoe @user"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "🎮 *Tic Tac Toe*\n\nGame would start here\nPlayer 1: ❌\nPlayer 2: ⭕\n\n(This is a simulation)"
        });
    },
    
    // Hangman game
    async hangman(sock, msg, args) {
        const words = ['TUNZY', 'WHATSAPP', 'BOT', 'PROGRAMMING', 'JAVASCRIPT', 'DEVELOPER'];
        const word = words[Math.floor(Math.random() * words.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎯 *Hangman Game*\n\nWord: ${'_ '.repeat(word.length)}\n\nGuess a letter: .guess <letter>\n\nExample: .guess T`
        });
    },
    
    // Guess letter for hangman
    async guess(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a letter\nExample: .guess A"
            });
            return;
        }
        
        const letter = args[0].toUpperCase();
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🔤 You guessed: ${letter}\n\nGame logic would process here\n(This is a simulation)`
        });
    },
    
    // Trivia game
    async trivia(sock, msg, args) {
        const questions = [
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                answer: "Paris"
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                answer: "Mars"
            },
            {
                question: "What is the largest mammal in the world?",
                options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
                answer: "Blue Whale"
            }
        ];
        
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🧠 *Trivia Question*\n\n${randomQuestion.question}\n\nOptions:\nA) ${randomQuestion.options[0]}\nB) ${randomQuestion.options[1]}\nC) ${randomQuestion.options[2]}\nD) ${randomQuestion.options[3]}\n\nAnswer with: .answer <letter>`
        });
    },
    
    // Answer trivia
    async answer(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide an answer\nExample: .answer A"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Answer submitted: ${args[0].toUpperCase()}\n\nAnswer checking would happen here\n(This is a simulation)`
        });
    },
    
    // Truth question
    async truth(sock, msg, args) {
        const truths = [
            "What's the most embarrassing thing you've ever done?",
            "Have you ever cheated on a test?",
            "What's your biggest fear?",
            "What's the worst lie you've ever told?",
            "What's your most awkward date story?",
            "Have you ever stolen something?",
            "What's your guilty pleasure?",
            "What's the craziest thing you've done for love?"
        ];
        
        const randomTruth = truths[Math.floor(Math.random() * truths.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🤔 *Truth Question*\n\n${randomTruth}\n\nYou must answer truthfully!`
        });
    },
    
    // Dare challenge
    async dare(sock, msg, args) {
        const dares = [
            "Send the last photo in your gallery to the group",
            "Call a random contact and sing happy birthday",
            "Do 10 pushups right now",
            "Eat a spoonful of a random condiment",
            "Speak in an accent for the next 5 messages",
            "Let the group choose your profile picture for 1 hour",
            "Send a voice note saying 'I love TUNZY MD'",
            "Dance for 30 seconds and send a video"
        ];
        
        const randomDare = dares[Math.floor(Math.random() * dares.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `😈 *Dare Challenge*\n\n${randomDare}\n\nYou must complete the dare!`
        });
    }
};
