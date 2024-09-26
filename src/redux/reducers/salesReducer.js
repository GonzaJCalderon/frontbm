import { ADD_SALE, FETCH_SALES } from '../actions/salesActions';

const initialState = {
  sales: [],
};

const salesReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SALE:
      return {
        ...state,
        sales: [...state.sales, action.payload],
      };
    case FETCH_SALES:
      return {
        ...state,
        sales: action.payload,
      };
    default:
      return state;
  }
};

export default salesReducer;
