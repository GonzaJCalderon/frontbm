import { SET_NOTIFICATIONS, CLEAR_NOTIFICATIONS, MARK_NOTIFICATIONS_AS_READ } from '../actions/actionTypes';

const initialState = {
    notifications: []
};

const notificationsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_NOTIFICATIONS:
            return { ...state, notifications: action.payload };

        case CLEAR_NOTIFICATIONS:
            return { ...state, notifications: [] }; // Borra todas las notificaciones

        case MARK_NOTIFICATIONS_AS_READ:
            return {
                ...state,
                notifications: state.notifications.map(notification => ({
                    ...notification,
                    read: true
                }))
            };

        default:
            return state;
    }
};

export default notificationsReducer;
