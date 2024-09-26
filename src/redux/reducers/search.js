const initialState = {
    loading: false,
    users: [],     // Cambiar results a users
    bienes: [], 
    error: null,
};

const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SEARCH_ITEMS_REQUEST':
            return { ...state, loading: true, error: null };
        case 'SEARCH_ITEMS_SUCCESS':
            console.log('Reducer Search Results:', action.payload); // Verifica los datos en el reducer
            return { 
                ...state, 
                loading: false, 
                users: action.payload.users || [], 
                bienes: action.payload.bienes || []
            };
        case 'SEARCH_ITEMS_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default searchReducer;
