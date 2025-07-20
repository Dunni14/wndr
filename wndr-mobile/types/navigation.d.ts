import type { RootStackParamList } from '../navigation/AppStack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 