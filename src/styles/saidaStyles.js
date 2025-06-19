import { StyleSheet } from 'react-native';

export const saidaStyles = StyleSheet.create({
  // Estilos específicos da tela de saida
  quantidadeText: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  estoqueAtualText: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 2,
  },
  textCancelado: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  
  estoqueInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  estoqueInfoText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});