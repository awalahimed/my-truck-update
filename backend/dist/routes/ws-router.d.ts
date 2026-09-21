export declare const wsRouter: {
    $: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        service: string;
        status: string;
    }, {
        service: string;
        status: string;
    }>, Record<never, never>, Record<never, never>>;
    handshake: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
        service: string;
        status: string;
    }, {
        service: string;
        status: string;
    }>, Record<never, never>, Record<never, never>>;
    driver: {
        createOffer: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
            offeredPrice: import("zod").ZodNumber;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
            offerId: string;
        }, {
            success: boolean;
            message: string;
            offerId: string;
        }>, Record<never, never>, Record<never, never>>;
        getAvailableOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            orders: any[];
            isLocked: boolean;
            lockedOrderId: any;
            accountStatus: any;
            message: string;
        } | {
            orders: {
                materials: unknown;
                driverOffer: any;
                driverOfferId: any;
                hasOffer: boolean;
                customerName: any;
                customerPhone: any;
                customerProfilePhoto: string;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
            isLocked: boolean;
            lockedOrderId: string;
            accountStatus?: undefined;
            message?: undefined;
        } | {
            orders: {
                materials: unknown;
                driverOffer: string;
                driverOfferId: string;
                hasOffer: boolean;
                customerName: string;
                customerPhone: any;
                customerProfilePhoto: string;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
            isLocked: boolean;
            lockedOrderId: any;
            accountStatus?: undefined;
            message?: undefined;
        }, {
            orders: any[];
            isLocked: boolean;
            lockedOrderId: any;
            accountStatus: any;
            message: string;
        } | {
            orders: {
                materials: unknown;
                driverOffer: any;
                driverOfferId: any;
                hasOffer: boolean;
                customerName: any;
                customerPhone: any;
                customerProfilePhoto: string;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
            isLocked: boolean;
            lockedOrderId: string;
            accountStatus?: undefined;
            message?: undefined;
        } | {
            orders: {
                materials: unknown;
                driverOffer: string;
                driverOfferId: string;
                hasOffer: boolean;
                customerName: string;
                customerPhone: any;
                customerProfilePhoto: string;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
            isLocked: boolean;
            lockedOrderId: any;
            accountStatus?: undefined;
            message?: undefined;
        }>, Record<never, never>, Record<never, never>>;
        getMyOffers: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            offers: {
                id: string;
                orderId: string;
                driverId: string;
                offeredPrice: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                respondedAt: Date;
            }[];
        }, {
            offers: {
                id: string;
                orderId: string;
                driverId: string;
                offeredPrice: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                respondedAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        cancelOffer: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("zod").ZodObject<{
            offerId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        updateLocation: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("zod").ZodObject<{
            latitude: import("zod").ZodNumber;
            longitude: import("zod").ZodNumber;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
        }, {
            success: boolean;
        }>, Record<never, never>, Record<never, never>>;
        getMyOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            orders: {
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            orders: {
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        getMyVehicle: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            vehicle: {
                id: string;
                driverId: string;
                type: string;
                make: string;
                model: string;
                year: string;
                plateNumber: string;
                color: string;
                capacity: string;
                registeredByAgentId: string;
                driverCycleCount: number;
                driverLifetimeEarnings: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }, {
            vehicle: {
                id: string;
                driverId: string;
                type: string;
                make: string;
                model: string;
                year: string;
                plateNumber: string;
                color: string;
                capacity: string;
                registeredByAgentId: string;
                driverCycleCount: number;
                driverLifetimeEarnings: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }>, Record<never, never>, Record<never, never>>;
    };
    owner: {
        getAllOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            orders: ({
                id: string;
                status: string;
                pickupAddress: string;
                deliveryAddress: string;
                vehicleType: string;
                estimatedPrice: string;
                finalPrice: string;
                createdAt: Date;
                customerPhone: any;
            } | {
                id: string;
                status: string;
                pickupAddress: string;
                deliveryAddress: string;
                vehicleType: string;
                estimatedPrice: string;
                finalPrice: string;
                createdAt: Date;
                customerPhone: any;
            })[];
        }, {
            orders: ({
                id: string;
                status: string;
                pickupAddress: string;
                deliveryAddress: string;
                vehicleType: string;
                estimatedPrice: string;
                finalPrice: string;
                createdAt: Date;
                customerPhone: any;
            } | {
                id: string;
                status: string;
                pickupAddress: string;
                deliveryAddress: string;
                vehicleType: string;
                estimatedPrice: string;
                finalPrice: string;
                createdAt: Date;
                customerPhone: any;
            })[];
        }>, Record<never, never>, Record<never, never>>;
        getDriverLocations: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>>, import("@orpc/server").MergedCurrentContext<import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, Record<never, never>>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            drivers: any[];
        }, {
            drivers: any[];
        }>, Record<never, never>, Record<never, never>>;
    };
    agent: {
        getPendingOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            orders: {
                customerName: any;
                customerPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            orders: {
                customerName: any;
                customerPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        getAllOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            orders: {
                customerName: any;
                customerPhone: any;
                driverName: any;
                driverPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            orders: {
                customerName: any;
                customerPhone: any;
                driverName: any;
                driverPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        getOrderById: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            order: {
                customerName: any;
                customerPhone: any;
                driverName: any;
                driverPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            };
        }, {
            order: {
                customerName: any;
                customerPhone: any;
                driverName: any;
                driverPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            };
        }>, Record<never, never>, Record<never, never>>;
        getAssignedOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            orders: {
                customerName: any;
                customerPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            orders: {
                customerName: any;
                customerPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        getApprovedByAgentOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            orders: {
                customerName: any;
                customerPhone: any;
                agentName: any;
                agentPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            orders: {
                customerName: any;
                customerPhone: any;
                agentName: any;
                agentPhone: any;
                pickupLocation: {
                    latitude: string;
                    longitude: string;
                };
                deliveryLocation: {
                    latitude: string;
                    longitude: string;
                };
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
    };
    customer: {
        subscribeToOrderUpdates: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        unsubscribeFromOrderUpdates: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        getMyOrders: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            orders: {
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }, {
            orders: {
                id: string;
                customerId: string;
                driverId: string;
                agentId: string;
                pickupAddress: string;
                pickupLatitude: string;
                pickupLongitude: string;
                deliveryAddress: string;
                deliveryLatitude: string;
                deliveryLongitude: string;
                materials: unknown;
                vehicleType: string;
                notes: string;
                estimatedPrice: string;
                finalPrice: string;
                agentFee: string;
                status: string;
                rejectionReason: string;
                createdAt: Date;
                updatedAt: Date;
                approvedAt: Date;
                rejectedAt: Date;
                assignedAt: Date;
                pickedUpAt: Date;
                deliveredAt: Date;
                completedAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        getOrderOffers: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("zod").ZodObject<{
            orderId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            offers: {
                id: string;
                driverId: string;
                driverName: any;
                driverPhone: any;
                vehicleInfo: string;
                offeredPrice: string;
                createdAt: Date;
            }[];
        }, {
            offers: {
                id: string;
                driverId: string;
                driverName: any;
                driverPhone: any;
                vehicleInfo: string;
                offeredPrice: string;
                createdAt: Date;
            }[];
        }>, Record<never, never>, Record<never, never>>;
        acceptOffer: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("zod").ZodObject<{
            offerId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        rejectOffer: import("@orpc/server").DecoratedProcedure<import("@orpc/server").MergedInitialContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        } & Record<never, never>, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }>, import("@orpc/server").MergedCurrentContext<{
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            } | null;
            authenticated: boolean;
        }, {
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("../database/schema/auth-schema.js").UserRole;
                phoneNumber: string;
            };
        }>, import("zod").ZodObject<{
            offerId: import("zod").ZodString;
        }, import("better-auth").$strip>, import("@orpc/server").Schema<{
            success: boolean;
            message: string;
        }, {
            success: boolean;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
    };
    onboarding: {
        updateOwnerProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            success: boolean;
            userId: string;
        }, {
            success: boolean;
            userId: string;
        }>, Record<never, never>, Record<never, never>>;
        updateDriverProfile: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            success: boolean;
            userId: string;
            licenseStatus: string;
        }, {
            success: boolean;
            userId: string;
            licenseStatus: string;
        }>, Record<never, never>, Record<never, never>>;
        reuploadDriverLicense: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            success: boolean;
            userId: string;
            licenseStatus: string;
            message: string;
        }, {
            success: boolean;
            userId: string;
            licenseStatus: string;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
        reuploadVehiclePhoto: import("@orpc/server").DecoratedProcedure<Record<never, never>, Record<never, never>, import("@orpc/server").Schema<unknown, unknown>, import("@orpc/server").Schema<{
            success: boolean;
            userId: string;
            vehicleStatus: string;
            message: string;
        }, {
            success: boolean;
            userId: string;
            vehicleStatus: string;
            message: string;
        }>, Record<never, never>, Record<never, never>>;
    };
};
export type WSRouter = typeof wsRouter;
//# sourceMappingURL=ws-router.d.ts.map