import { Action, FILTER_RESET, FILTER_SET_NAMESPACE, FILTER_SET_SEARCH } from '../actions/actions';

export interface FilterState {
  namespaces: Set<string>;
  search: string;
}

export const INITIAL_STATE: FilterState = {
  namespaces: new Set(),
  search: ''
};

function filter(filters = INITIAL_STATE, action: Action) {
  let newFilters = {...filters};
  switch (action.type) {
    case FILTER_SET_NAMESPACE:
      newFilters.namespaces = new Set(action.namespaces);
      break;
    case FILTER_SET_SEARCH:
      newFilters.search = action.search;
      break;
    case FILTER_RESET:
      newFilters = {...INITIAL_STATE};
      break;

    default:
      break;
  };

  return newFilters;
}

export default filter;
