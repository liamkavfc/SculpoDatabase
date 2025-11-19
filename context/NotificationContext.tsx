import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Snackbar from '../components/Snackbar';

// Colors interface - apps should provide their own Colors
interface Colors {
  white: string;
  black: string;
  primary: string;
  secondary: string;
  darkPrimary: string;
  border: string;
}

interface NotificationContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

interface ConfirmDialogData {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

interface NotificationProviderProps {
    children: ReactNode;
    colors: Colors;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children, colors }: NotificationProviderProps) {
    const [snackbar, setSnackbar] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        visible: false,
        message: '',
        type: 'success'
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        visible: boolean;
        data: ConfirmDialogData | null;
    }>({
        visible: false,
        data: null
    });

    const showSuccess = (message: string) => {
        setSnackbar({
            visible: true,
            message,
            type: 'success'
        });
    };

    const showError = (message: string) => {
        setSnackbar({
            visible: true,
            message,
            type: 'error'
        });
    };

    const showConfirm = (
        title: string, 
        message: string, 
        onConfirm: () => void, 
        onCancel?: () => void
    ) => {
        setConfirmDialog({
            visible: true,
            data: { title, message, onConfirm, onCancel }
        });
    };

    const hideSnackbar = () => {
        setSnackbar(prev => ({ ...prev, visible: false }));
    };

    const hideConfirmDialog = () => {
        setConfirmDialog({ visible: false, data: null });
    };

    const handleConfirm = () => {
        if (confirmDialog.data?.onConfirm) {
            confirmDialog.data.onConfirm();
        }
        hideConfirmDialog();
    };

    const handleCancel = () => {
        if (confirmDialog.data?.onCancel) {
            confirmDialog.data.onCancel();
        }
        hideConfirmDialog();
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        modalContainer: {
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 24,
            minWidth: 300,
            maxWidth: 400,
            shadowColor: colors.black,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.darkPrimary,
            marginBottom: 12,
            textAlign: 'center',
        },
        modalMessage: {
            fontSize: 16,
            color: colors.darkPrimary,
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 22,
        },
        modalActions: {
            flexDirection: 'row',
            gap: 12,
            justifyContent: 'center',
        },
        modalButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            minWidth: 100,
        },
        cancelButton: {
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        confirmButton: {
            backgroundColor: colors.primary,
        },
        cancelButtonText: {
            color: colors.darkPrimary,
            fontSize: 16,
            fontWeight: '500',
        },
        confirmButtonText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '500',
        },
    });

    return (
        <NotificationContext.Provider value={{ showSuccess, showError, showConfirm }}>
            {children}
            
            {/* Snackbar for success/error messages */}
            <Snackbar
                visible={snackbar.visible}
                message={snackbar.message}
                type={snackbar.type}
                onHide={hideSnackbar}
            />

            {/* Modal for confirmation dialogs */}
            <Modal
                visible={confirmDialog.visible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {confirmDialog.data?.title}
                        </Text>
                        <Text style={styles.modalMessage}>
                            {confirmDialog.data?.message}
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleCancel}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirm}
                            >
                                <Text style={styles.confirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
