/**	MAIN SAGA ============================================================= */
import { fork } from 'redux-saga/effects';
import * as ui from './ui';

const sagas = [
	ui,
];

/**
 * Root of all sagas
 * ------------------------------------------------------------- *
 * All sagas are imported here and added into a single saga. Each
 * sag file is basically an export of sagas that you want to run from the
 * beginning.
 */
export default function* mainSaga() {
	yield sagas.map(saga => (
		Object.keys(saga).map(fn => (
			fork(saga[fn])
		))
	));
}
