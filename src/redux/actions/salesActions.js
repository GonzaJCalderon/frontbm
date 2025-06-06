import axios from 'axios'; // Versión estándar de axios

export const ADD_SALE = 'ADD_SALE';
export const FETCH_SALES = 'FETCH_SALES';

export const addSale = (saleData) => async (dispatch) => {
  try {
    const response = await axios.post('/sales', saleData);
    dispatch({ type: ADD_SALE, payload: response.data });
  } catch (error) {
  }
};

export const fetchSales = () => async (dispatch) => {
  try {
    const response = await axios.get('/sales');
    dispatch({ type: FETCH_SALES, payload: response.data });
  } catch (error) {
  }
};
