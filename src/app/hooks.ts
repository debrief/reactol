import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'
import type { DataDispatch, RootDataState } from '../dataStore'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// Use for data store
export const useDataDispatch = useDispatch.withTypes<DataDispatch>()
export const useDataSelector = useSelector.withTypes<RootDataState>()
