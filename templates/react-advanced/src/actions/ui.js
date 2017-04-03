import ActionTypes from '../constants/actionTypes';

export default {
	requestRefresh: refresh => ({
		type: ActionTypes.UI_REQUEST_REFRESH,
		requestRefresh: refresh,
	}),
};
