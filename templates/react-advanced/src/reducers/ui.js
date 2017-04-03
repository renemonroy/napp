import { fromJS } from 'immutable';
import { ui as initialState } from '../constants/initialState';
import ActionType from '../constants/actionTypes';

export const requestRefresh = (state, refresh) => (
	state.set('requestRefresh', fromJS(refresh))
);

function UI(state = initialState, action) {
	switch (action.type) {
	case ActionType.UI_REQUEST_REFRESH:
		return requestRefresh(state, action.requestRefresh);
	default:
		return state;
	}
}

export default UI;
