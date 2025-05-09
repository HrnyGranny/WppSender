document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const codeArea = document.getElementById('codeArea');
    const copyBtn = document.getElementById('copyBtn');
    const codeLoader = document.querySelector('.code-loader');
    
    // Form elements
    const messageText = document.getElementById('messageText');
    const messageDelay = document.getElementById('messageDelay');
    const cycleDelay = document.getElementById('cycleDelay');
    const splitOption = document.getElementById('splitOption');
    
    // Initially show the loader and hide code area
    codeArea.style.display = 'none';
    codeLoader.style.display = 'flex';
    
    // Initially disable the copy button
    copyBtn.classList.add('copy-btn-disabled');
    
    // Generate script when button is clicked
    generateBtn.addEventListener('click', function() {
        // Get values from form
        const messages = messageText.value.trim();
        const msgDelay = messageDelay.value;
        const cycleDly = cycleDelay.value;
        const splitType = splitOption.value;
        
        if (!messages) {
            codeArea.textContent = '// Please enter at least one message to send';
            // Hide loader and show code area
            codeLoader.style.display = 'none';
            codeArea.style.display = 'block';
            
            // Enable copy button even for error messages
            copyBtn.classList.remove('copy-btn-disabled');
            return;
        }
        
        // Generate the script with custom parameters
        const generatedScript = generateWhatsAppScript(messages, msgDelay, cycleDly, splitType);
        
        // Display the generated script
        codeArea.textContent = generatedScript;
        
        // Hide loader and show code
        codeLoader.style.display = 'none';
        codeArea.style.display = 'block';
        
        // Enable the copy button
        copyBtn.classList.remove('copy-btn-disabled');
        
        // Highlight effect
        codeArea.style.opacity = '0';
        setTimeout(() => {
            codeArea.style.opacity = '1';
        }, 50);
    });
    
    // Function to generate the WhatsApp script with custom parameters
    function generateWhatsAppScript(messages, messageDelay, cycleDelay, splitOption) {
        // Define the split regex based on the option selected
        let splitRegex;
        switch(splitOption) {
            case 'commas':
                splitRegex = ',';
                break;
            case 'semicolons':
                splitRegex = ';';
                break;
            case 'lines':
            default:
                splitRegex = /[\\n\\t]+/;
        }

        const script = `async function WhatsAppSender(scriptText) {
    try {
        // Verify that scriptText is not empty and is a string
        if (!scriptText || typeof scriptText !== "string") {
            throw new Error("The provided script is invalid or empty");
        }

        // Process the text into messages based on the split type
        const splitType = "${splitOption === 'commas' ? 'comma' : splitOption === 'semicolons' ? 'semicolon' : 'line'}";
        console.log("Splitting messages by " + splitType);
        
        // Split the text according to the chosen method
        const lines = scriptText.split(${typeof splitRegex === 'string' ? `"${splitRegex}"` : splitRegex})
            .map(line => line.trim())
            .filter(line => line);
            
        if (lines.length === 0) {
            throw new Error("The script contains no valid messages to send");
        }
        
        console.log(\`Prepared \${lines.length} messages for sending\`);

        // Find necessary elements in the DOM
        const main = document.querySelector("#main");
        if (!main) {
            throw new Error("The main container (#main) was not found. Make sure WhatsApp Web is open.");
        }

        const textarea = main.querySelector('div[contenteditable="true"]');
        if (!textarea) {
            throw new Error("No editable textarea is available. Make sure a conversation is open.");
        }

        // Infinite loop to send messages continuously
        console.log("Starting message loop...");
        let cycleCount = 0;
        
        while (true) {
            cycleCount++;
            console.log(\`Starting cycle #\${cycleCount}\`);
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                try {
                    // Focus on the textarea and insert text
                    textarea.focus();
                    document.execCommand('insertText', false, line);
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));

                    // Simulate pressing the Enter key to send the message
                    const enterEvent = new KeyboardEvent("keydown", {
                        key: "Enter",
                        code: "Enter",
                        keyCode: 13, // Enter key code
                        which: 13,
                        bubbles: true,
                    });
                    textarea.dispatchEvent(enterEvent);

                    // Pause between messages if it's not the last one
                    if (i !== lines.length - 1) {
                        console.log(\`Sent: "\${line}" - Waiting ${messageDelay}ms before next message\`);
                        await new Promise(resolve => setTimeout(resolve, ${messageDelay}));
                    } else {
                        console.log(\`Sent final message of cycle: "\${line}"\`);
                    }
                } catch (innerError) {
                    console.error(\`Error sending the message "\${line}":, innerError\`);
                }
            }

            // Pause between cycles
            console.log(\`Cycle #\${cycleCount} completed. Waiting ${cycleDelay}ms before next cycle...\`);
            await new Promise(resolve => setTimeout(resolve, ${cycleDelay}));
        }
    } catch (error) {
        console.error("Error in WhatsAppSender:", error);
    }
}

// Call the function with your customized messages
WhatsAppSender(\`${messages.replace(/`/g, '\\`')}\`)
    .then(() => console.log("Message sending completed"))
    .catch(error => console.error("A general execution error occurred:", error));

// To stop the script, refresh the page or close the browser tab
console.log("WhatsApp Loop Message Sender started. To stop, refresh the page.");`;

        return script;
    }
    
    // Copy to clipboard functionality
    copyBtn.addEventListener('click', function() {
        // Only copy if button is not disabled
        if (!copyBtn.classList.contains('copy-btn-disabled')) {
            const codeText = codeArea.textContent;
            navigator.clipboard.writeText(codeText).then(() => {
                // Change button text temporarily
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        }
    });
});