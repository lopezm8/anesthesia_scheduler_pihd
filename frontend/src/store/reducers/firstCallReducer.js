import { SET_FIRST_CALL } from '../../actions/types';
import { CLEAR_FIRST_CALL_DATA } from '../../actions/types';

const initialState = {
  firstCallAssignments: [],
};

export const firstCallReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_FIRST_CALL_DATA:
      return {
        ...state,
        firstCallAssignments: state.firstCallAssignments.filter(item => new Date(item.date).getMonth() + 1 !== action.payload),
      };
    default:
      return state;
  }
};
