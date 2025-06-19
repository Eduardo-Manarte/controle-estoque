import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';

export const estoqueStyles = StyleSheet.create({
  // Estilos específicos da tela de estoque
  produtoCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    marginHorizontal: 16,
  },

  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  produtoPreco: {
    fontSize: 16,
    color: colors.success,
    fontWeight: 'bold',
  },
  produtoCusto: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  produtoMinimo: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '500',
  },

  produtoActions: {
    alignItems: 'center',
  },
  quantidadeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantidadeText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginHorizontal: 5,
  },
  deleteButton: {
    padding: 8,
    marginHorizontal: 5,
  },

  // Modal de foto
  photoButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 5,
  },
});