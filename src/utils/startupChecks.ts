import { logger } from './logger';
import { MICRO_SKILLS } from '../engine/AdaptiveEngine';
import { useStore } from '../store';

export const runStartupChecks = () => {
    logger.info('Running startup checks...');
    const errors: string[] = [];

    // 1. Check Critical Constants
    try {
        if (!MICRO_SKILLS || Object.keys(MICRO_SKILLS).length === 0) {
            errors.push('MICRO_SKILLS is undefined or empty');
        } else {
            logger.debug(`MICRO_SKILLS loaded: ${Object.keys(MICRO_SKILLS).length} skills defined`);
        }
    } catch (e) {
        errors.push(`Failed to access MICRO_SKILLS: ${e}`);
    }

    // 2. Check Store Initialization
    try {
        const state = useStore.getState();
        if (!state.userProfile) {
            errors.push('Store userProfile is missing');
        } else {
            logger.debug('Store initialized successfully');
        }
    } catch (e) {
        errors.push(`Store access failed: ${e}`);
    }

    // 3. Environment Checks
    if (typeof window === 'undefined') {
        errors.push('Window object missing (not running in browser?)');
    }

    if (errors.length > 0) {
        logger.error('Startup checks failed', errors);
        throw new Error(`Startup failed: ${errors.join(', ')}`);
    }

    logger.info('Startup checks passed ✅');
    return true;
};
