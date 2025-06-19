import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  background: '#f5f5f5',
  white: '#fff',
  text: {
    primary: '#333',
    secondary: '#666',
    light: '#999',
  },
  border: '#ddd',
  placeholder: '#ccc',
};

export const globalStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
  },
  
  // Busca
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
    marginRight: 10,
    height: 45,
  },
  headerSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 10,
  },

  // Botões
  iconButton: {
    padding: 8,
  },
  refreshButton: {
    backgroundColor: colors.white,
    width: 45,
    height: 45,
    borderRadius: 8,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 2,
  },
  itemCardCanceled: {
    backgroundColor: '#f8f8f8',
    opacity: 0.7,
  },
  itemCardError: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },

  // Imagens
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  noImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Imagem do produto
  produtoImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemNoImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  // Informações do produto
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  itemDetails: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text.primary,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },

  // Textos
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: colors.success,
    fontWeight: 'bold',
  },
  secondaryText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '500',
  },

  // Textos de quantidade/estoque
  quantityText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stockText: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 2,
  },
  observationText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Textos de erro
  errorText: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorSubText: {
    color: colors.text.light,
    fontSize: 12,
    marginTop: 2,
  },

  // Data/timestamp
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  dataText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
  },

  // Vazio
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.text.light,
    marginTop: 5,
  },

  // FAB (Floating Action Button)
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: colors.placeholder,
  },

  // Botões de ação
  actionButton: {
    padding: 4,
  },
  
  // Badge de cancelado
  canceledBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 5,
  },
  canceledText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  textCanceled: {
    textDecorationLine: 'line-through',
    color: colors.text.light,
  },

  // Modal
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text.primary,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalSaveButton: {
    backgroundColor: colors.success,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  modalCancelButtonText: {
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  modalSaveButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },

  // Formulários
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },

  // Picker
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },

  // TextArea
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Botões
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontWeight: 'bold',
  },

  // Lista
  list: {
    flex: 1,
    paddingTop: 10,
  },
  listWithPadding: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
});