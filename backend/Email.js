import emailjs from '@emailjs/nodejs';


emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

async function sendEmail(email, code) {
    const res = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        { email: email, passcode: code.toString() }
    );
    return res;
}

export default sendEmail;
