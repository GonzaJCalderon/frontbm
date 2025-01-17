// reducers/index.js
import { combineReducers } from 'redux';
import bienesReducer from './bienes';
import usuariosReducer from './usuarios';
import authReducer from './auth';
import searchReducer from './search';
import salesReducer from './salesReducer';
import stockReducers from './stockReducers';
import renaperReducer from './renaperReducer';

const rootReducer = combineReducers({
    bienes: bienesReducer,
    usuarios: usuariosReducer,
    auth: authReducer,
    search: searchReducer,
    sales: salesReducer,
    stock: stockReducers,
    renaperReducer: renaperReducer,
});

export default rootReducer;
