import { take, call, put } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { UIActions } from '../actions';

function createCacheChannel(nc) {
	return eventChannel((emit) => {
		const refresh = (data) => {
			emit({ status: 'REFRESH', data });
		};
		nc.on('refresh', refresh);
		const unsubscribe = () => {
			nc.off('refresh', refresh);
		};
		return unsubscribe;
	});
}

export function* watchCache() {
	if (self.navigator && window.ncache && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
		const evChannel = yield call(createCacheChannel, window.ncache);
		while (true) {
			const { status } = yield take(evChannel);
			if (status === 'REFRESH') {
				yield put(UIActions.requestRefresh(true));
			}
		}
	}
}
