var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var outletSchema = schema({
    id: {
        type: ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    brand: {
        id: {
            type: ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }
})

var brandSchema = schema({
    id: {
        type: ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

var usersSchema = new schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    brands: {
        type: [
            brandSchema
        ],
        default: undefined
    },
    outlets: {
        type: [
            outletSchema
        ],
        default: undefined
    },
    role: {
        name: {
            type: String,
            enums: ["superAdmin", "admin", "brand", "outlet"],
            required: true
        },
        subRoles: [
            {
                type: String,
                enums: ["admin", "manager", "billing", "seller"]
            }
        ]
    },
    permissions: [
        {
            permissionId: {
                type: Number,
                required: true
            },
            permissionName: {
                type: String,
                required: true
            }
        }
    ]
}, {
    timestamps: true
});

usersSchema.pre("validate", function (next) {
    if ((!this.outlets || this.outlets.length === 0) && (!this.brands || this.brands.length === 0) && this.role.name !== 'admin' && this.role.name !== "superAdmin") {
        next(new Error("there must be atleast one outlet or brands belonging to a user"));
    }
    next();
})

module.exports = mongoose.model("user", usersSchema);