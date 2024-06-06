import React, {useState} from 'react';
import Backendless from 'backendless';

const Feedback = () => {
    const [message, setMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState('Advice');
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');

    const handleMessageChange = (event) => {
        setMessage(event.target.value);
    };

    const handleFeedbackTypeChange = (event) => {
        setFeedbackType(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const currentUser = await Backendless.UserService.getCurrentUser();
        const bodyParts = new Backendless.Bodyparts();
        const emailContent = `
            <p><strong>From:</strong> ${currentUser.username} (${currentUser.email})</p>
            <p><strong>Message: </strong>${message}</p>
        `;
        bodyParts.textmessage = `From: ${currentUser.username} (${currentUser.email})\n\nMessage: ${message}`;
        bodyParts.htmlmessage = emailContent;
        const subject = `Feedback: ${feedbackType}`;
        try {
            await Backendless.Messaging.sendEmail(subject, bodyParts, [process.env.REACT_APP_DEVELOPER_EMAIL]);
            setEmailSent(true);
            setError('');
        } catch (err) {
            setError(err.message);
            setEmailSent(false);
        } finally {
            setMessage('');
        }
    };

    return (
        <div className="container col-xl-6 mt-5">
            <h1 className="mb-4 text-center">Send Feedback to Developer</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        className="form-control"
                        rows={5}
                        value={message}
                        onChange={handleMessageChange}
                        required
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="feedbackType">Type of Feedback</label>
                    <select
                        id="feedbackType"
                        className="form-control"
                        value={feedbackType}
                        onChange={handleFeedbackTypeChange}
                    >
                        <option value="Error">Error</option>
                        <option value="Advice">Advice</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary mb-2">Send Feedback</button>
            </form>
            {emailSent && <div className="alert alert-success mt-2">Email has been sent successfully!</div>}
            {error && <div className="alert alert-danger">Error: {error}</div>}
        </div>
    );
};

export default Feedback;
