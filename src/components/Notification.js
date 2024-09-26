// Notification.js
import React from 'react';
import PropTypes from 'prop-types';

const Notification = ({ message, type, onClose }) => {
    const notificationStyle = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
    };

    return (
        <div className={`fixed bottom-5 right-5 p-4 rounded ${notificationStyle[type]} flex items-center space-x-4`}>
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-auto text-white hover:text-gray-200"
            >
                <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};

Notification.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error']).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Notification;
