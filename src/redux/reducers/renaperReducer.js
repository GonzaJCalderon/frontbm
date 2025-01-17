const initialState = {
    loading: false,
    persona: null,
    error: null,
};

const renaperReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_RENAPER_REQUEST':
            return { ...state, loading: true, error: null };
        case 'FETCH_RENAPER_SUCCESS':
            return { ...state, loading: false, persona: action.payload };
        case 'FETCH_RENAPER_FAILURE':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default renaperReducer;
