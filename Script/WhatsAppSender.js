console.log(`
 _   _                 _____
| | | |               / ____|
| |_| |_ __ _ __  _   | |  __ _ __ __ _ _ __  _ __  _   _
|  _  | '__| '_ \\| | | | | |_ | '__/ _\` | '_ \\| '_ \\| | | |
| | | | |  | | | | |_| | |__| | | | (_| | | | | | | | |_| |
|_| |_|_|  |_| |_|\\__, |\\_____|_|  \\__,_|_| |_|_| |_|\\__, |
                   __/ |                             __/ |
                  |___/                             |___/
`);

async function WhatsAppSender(scriptText) {
    try {
        // Verify that scriptText is not empty and is a string
        if (!scriptText || typeof scriptText !== "string") {
            throw new Error("The provided script is invalid or empty");
        }

        // Process the text into lines and clean up empty entries
        const lines = scriptText.split(/[\n\t]+/).map(line => line.trim()).filter(line => line);
        if (lines.length === 0) {
            throw new Error("The script contains no valid lines to send");
        }

        // Find necessary elements in the DOM
        const main = document.querySelector("#main");
        if (!main) {
            throw new Error("The main container (#main) was not found");
        }

        const textarea = main.querySelector('div[contenteditable="true"]');
        if (!textarea) {
            throw new Error("No editable textarea is available. Make sure a conversation is open.");
        }

        // Infinite loop to send messages continuously
        while (true) {
            for (const line of lines) {
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

                    // Pause 250 ms between messages if it's not the last one
                    if (lines.indexOf(line) !== lines.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 250));
                    }
                } catch (innerError) {
                    console.error(`Error sending the line "${line}":`, innerError);
                }
            }

            // Pause 2 seconds between loops
            console.log("Waiting before the next cycle of messages...");
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } catch (error) {
        console.error("Error in WhatsAppSender:", error);
    }
}

// Call the function with the message "Hello" in a loop
WhatsAppSender("Hello")
    .then(() => console.log("Message sending completed"))
    .catch(error => console.error("A general execution error occurred:", error));
