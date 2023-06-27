import { SET_FIRST_CALL } from '../../actions/types';

const initialState = {
  firstCallAssignments: [],
};

export const firstCallReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FIRST_CALL:
      return {
        ...state,
        firstCallAssignments: [...state.firstCallAssignments, action.payload],
      };
    default:
      return state;
  }
};

