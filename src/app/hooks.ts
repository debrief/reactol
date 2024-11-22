import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, AppRootState } from './appStore'
import type { DataDispatch, RootDataState as DataRootState } from './dataStore'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<AppRootState>()

// Use for data store
export const useDataDispatch = useDispatch.withTypes<DataDispatch>()
export const useDataSelector = useSelector.withTypes<DataRootState>()
