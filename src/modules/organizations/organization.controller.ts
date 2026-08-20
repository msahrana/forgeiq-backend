import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { organizationServices } from './organization.service';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import AppError from '../../errors/AppError';

/*
|--------------------------------------------------------------------------
| Create Organization
|--------------------------------------------------------------------------
*/

const createOrganization = catchAsync(async (req: Request, res: Response) => {
    const { name, slug, logo, industry, country, timezone } = req.body;

    if (!req.user?.id) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'User is not authenticated',
        );
    }

    const ownerId = req.user.id;

    const result = await organizationServices.createOrganizationIntoDB(
        ownerId,
        {
            name,
            slug,
            logo,
            industry,
            country,
            timezone,
        },
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Organization created successfully',
        data: result,
    });
});

/*
|--------------------------------------------------------------------------
| Get All Organizations
|--------------------------------------------------------------------------
*/

const getAllOrganizations = catchAsync(async (req: Request, res: Response) => {
    const result = await organizationServices.getAllOrganizationsIntoDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Organizations retrieved successfully',
        data: result,
    });
});

/*
|--------------------------------------------------------------------------
| Get Organization By ID
|--------------------------------------------------------------------------
*/

const getOrganizationById = catchAsync(async (req: Request, res: Response) => {
    const result = await organizationServices.getOrganizationByIdIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Organization retrieved successfully',
        data: result,
    });
});

/*
|--------------------------------------------------------------------------
| Get Organizations By Owner
|--------------------------------------------------------------------------
*/

const getOrganizationsByOwner = catchAsync(
    async (req: Request, res: Response) => {
        const result = await organizationServices.getOrganizationsByOwnerIntoDB(
            req.params.ownerId as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Owner organizations retrieved successfully',
            data: result,
        });
    },
);

/*
|--------------------------------------------------------------------------
| Update Organization
|--------------------------------------------------------------------------
*/

const updateOrganization = catchAsync(async (req: Request, res: Response) => {
    const result = await organizationServices.updateOrganizationIntoDB(
        req.params.id as string,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Organization updated successfully',
        data: result,
    });
});

/*
|--------------------------------------------------------------------------
| Update Organization Status
|--------------------------------------------------------------------------
*/

const updateOrganizationStatus = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await organizationServices.updateOrganizationStatusIntoDB(
                req.params.id as string,
                req.body.status,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Organization status updated successfully',
            data: result,
        });
    },
);

/*
|--------------------------------------------------------------------------
| Delete Organization
|--------------------------------------------------------------------------
*/

const deleteOrganization = catchAsync(async (req: Request, res: Response) => {
    await organizationServices.deleteOrganizationIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Organization cancelled successfully',
        data: null,
    });
});

/*
|--------------------------------------------------------------------------
| Add Member
|--------------------------------------------------------------------------
*/

const addMember = catchAsync(async (req: Request, res: Response) => {
    const result = await organizationServices.addMemberIntoDB(
        req.params.organizationId as string,
        req.body.userId,
        req.body.role,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Organization member invited successfully',
        data: result,
    });
});

/*
|--------------------------------------------------------------------------
| Get Members
|--------------------------------------------------------------------------
*/

const getMembers = catchAsync(async (req: Request, res: Response) => {
    const result = await organizationServices.getMembersIntoDB(
        req.params.organizationId as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Organization members retrieved successfully',
        data: result,
    });
});

/*
|--------------------------------------------------------------------------
| Update Member Role
|--------------------------------------------------------------------------
*/

const updateMemberRole = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, memberId } = req.params;

    const { role } = req.body;

    const result = await organizationServices.updateMemberRoleIntoDB(
        organizationId as string,
        memberId as string,
        role,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member role updated successfully',
        data: result,
    });
});

/*
|--------------------------------------------------------------------------
| Update Member Status
|--------------------------------------------------------------------------
*/

const updateMemberStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await organizationServices.updateMemberStatusIntoDB(
        req.params.organizationId as string,
        req.params.memberId as string,
        req.body.status,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member status updated successfully',
        data: result,
    });
});

/*
|--------------------------------------------------------------------------
| Remove Member
|--------------------------------------------------------------------------
*/

const removeMember = catchAsync(async (req: Request, res: Response) => {
    const result = await organizationServices.removeMemberIntoDB(
        req.params.organizationId as string,
        req.params.memberId as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Organization member removed successfully',
        data: result,
    });
});

export const organizationControllers = {
    createOrganization,
    getAllOrganizations,
    getOrganizationById,
    getOrganizationsByOwner,
    updateOrganization,
    updateOrganizationStatus,
    deleteOrganization,
    addMember,
    getMembers,
    updateMemberRole,
    updateMemberStatus,
    removeMember,
};
