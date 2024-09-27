// src/redux/actions/search.js

export const searchItems = (term) => async (dispatch) => {
    dispatch({ type: 'SEARCH_ITEMS_REQUEST' });

    try {
        // Obtener el token de localStorage (si es necesario)
        const token = localStorage.getItem('token');
        
        // Configuración de los headers si necesitas incluir autenticación
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }

        // Realizar la solicitud con fetch
        const response = await fetch(`/search?nombre=${term}`, {
            method: 'GET',
            headers: headers
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        // Procesar la respuesta JSON
        const data = await response.json();

        // Dispatch de la acción exitosa
        dispatch({
            type: 'SEARCH_ITEMS_SUCCESS',
            payload: data,
        });

    } catch (error) {
        console.error('Search Error:', error);
        dispatch({
            type: 'SEARCH_ITEMS_ERROR',
            payload: error.message,
        });
    }
};
