import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface SnackbarProps {
    message: string;
    visible: boolean;
    onHide: () => void;
    type?: 'success' | 'error';
    duration?: number;
}

export default function Snackbar({ 
    message, 
    visible, 
    onHide, 
    type = 'success', 
    duration = 3000 
}: SnackbarProps) {
    const [slideAnim] = useState(new Animated.Value(-100));

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideSnackbar();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideSnackbar = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onHide();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View 
            style={[
                styles.container, 
                type === 'success' ? styles.success : styles.error,
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    success: {
        backgroundColor: '#4CAF50',
    },
    error: {
        backgroundColor: '#F44336',
    },
    message: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});
