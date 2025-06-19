import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';

export const entradaStyles = StyleSheet.create({
  // Estilos específicos da tela de entrada
  entradaFab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});