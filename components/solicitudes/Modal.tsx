import { Platform, Modal as RNModal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/styles/authStyles';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ visible, onClose, title, children, footer }: ModalProps) {
  return (
    <RNModal 
      visible={visible} 
      transparent 
      animationType={Platform.OS === 'web' ? 'fade' : 'slide'} 
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            {Platform.OS !== 'web' && <View style={styles.dragHandle} />}
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}>
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: Platform.OS === 'web' ? 12 : 0,
    borderBottomRightRadius: Platform.OS === 'web' ? 12 : 0,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
    height: Platform.OS === 'web' ? '90%' : '92%',
    maxHeight: Platform.OS === 'web' ? '90%' : '92%',
    ...Platform.select({
      web: { 
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 16,
    paddingTop: Platform.OS === 'web' ? 20 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  dragHandle: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 22 : 18,
    fontWeight: '700',
    color: colors.primaryDark,
    flex: 1,
    paddingRight: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.gray,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Platform.OS === 'web' ? 20 : 16,
    paddingBottom: Platform.OS === 'web' ? 20 : 24,
  },
  footer: {
    padding: Platform.OS === 'web' ? 16 : 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'web' ? 16 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
});

